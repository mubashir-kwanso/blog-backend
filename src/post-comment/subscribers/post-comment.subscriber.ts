import {
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { PostComment } from '../entities';

/**
 * Subscribes to `PostComment` entity events.
 */
@EventSubscriber()
export class PostCommentSubscriber
  implements EntitySubscriberInterface<PostComment>
{
  /**
   * Indicates that this subscriber only listen to `PostComment` events.
   */
  listenTo() {
    return PostComment;
  }

  /**
   * This method is called before the `PostComment` entity is removed.
   *
   * We are using `manager.deleteMany()` method which will delete all `PostComment` nested under the `PostComment being deleted` without triggering the `PostCommentSubscriber` repeatedly.
   *
   * To find the nested comments, we are using a recursive function that finds all the children of the deleting `PostComment` and then deletes them in one DB query.
   */
  async beforeRemove(event: RemoveEvent<PostComment>) {
    if (!event.entity) {
      return;
    }
    const deletingCommentId = event.entity._id;
    const commentIdsToDelete: ObjectId[] = [];
    const postCommentRepository = event.manager.getMongoRepository(PostComment);

    // Get all the children of the deleting comment
    async function recurse(commentId: ObjectId) {
      const comments: Pick<PostComment, '_id'>[] =
        await postCommentRepository.find({
          where: {
            reply_to_comment_id: commentId,
          },
          select: ['_id'],
        });
      if (comments.length === 0) {
        return;
      }
      for (const comment of comments) {
        commentIdsToDelete.push(comment._id);
        await recurse(comment._id);
      }
    }

    await recurse(deletingCommentId);

    // Delete all children comments
    await postCommentRepository.deleteMany({
      _id: { $in: commentIdsToDelete },
    });
  }
}

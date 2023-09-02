import { ObjectId } from 'mongodb'
import { FollowerType } from '~/types'

export default class Follower {
  _id?: ObjectId
  followed_user_id: ObjectId
  user_id: ObjectId
  created_at?: Date
  constructor({ _id, followed_user_id, user_id, created_at }: FollowerType) {
    this._id = _id
    this.followed_user_id = followed_user_id
    this.user_id = user_id
    this.created_at = created_at || new Date()
  }
}

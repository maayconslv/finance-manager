import { UniqueEntityId } from "../object-values/unique-entity-id";

export class BaseEntity<T> {
  private _id: UniqueEntityId;
  protected props: T;

  get id() {
    return this._id.toString();
  }

  protected constructor(props: T, id?: UniqueEntityId) {
    this._id = id ?? new UniqueEntityId();
    this.props = props;
  }
}

import { UniqueEntityId } from "../object-values/unique-entity-id";

export class BaseEntity<T> {
  protected id: UniqueEntityId;
  protected props: T;
  protected createdAt: Date;
  protected updatedAt?: Date;

  protected constructor(props: T, id?: UniqueEntityId) {
    this.id = id ?? new UniqueEntityId();
    this.createdAt = new Date();
    this.props = props;
  }
}

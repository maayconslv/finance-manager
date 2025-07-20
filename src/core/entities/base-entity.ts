import { UniqueEntityId } from "../object-values/unique-entity-id";

export class BaseEntity<T> {
  protected id: UniqueEntityId;
  protected props: T;

  protected constructor(props: T, id?: UniqueEntityId) {
    this.id = id ?? new UniqueEntityId();
    this.props = props;
  }
}

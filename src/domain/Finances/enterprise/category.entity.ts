import { BaseEntity } from "@/core/entities/base-entity";
import { UniqueEntityId } from "@/core/object-values";
import { Optional } from "@/core/types/optional";

interface CategoryProps {
  name: string;
  colorCode: string;
  userId: UniqueEntityId;
  createdAt: Date;
  deletedAt?: Date;
  updatedAt?: Date;
}

export class CategoryEntity extends BaseEntity<CategoryProps> {
  get name() {
    return this.props.name;
  }

  get colorCode() {
    return this.props.colorCode;
  }

  get userId() {
    return this.props.userId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  set name(name: string) {
    this.props.updatedAt = new Date();
    this.props.name = name;
  }

  static create(props: Optional<CategoryProps, "createdAt">, id?: UniqueEntityId) {
    return new CategoryEntity({ ...props, createdAt: new Date() }, id);
  }
}

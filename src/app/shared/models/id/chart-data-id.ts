import { EntityType } from "../entity-type.models";
import { EntityId } from "./entity-id";

export class ChartDataId implements EntityId {
  entityType = EntityType.DEVICE;
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

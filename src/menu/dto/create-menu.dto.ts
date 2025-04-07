// dto/create-menu.dto.ts
export class CreateMenuItemDto {
    readonly name: string;
    readonly description?: string;
    readonly price?: number;
  }
  
  export class CreateMenuDto {
    // Название меню (опционально)
    readonly title?: string;
    // Идентификатор филиала, к которому привязано меню
    readonly branchId: number;
    // Опциональный список пунктов меню
    readonly items?: CreateMenuItemDto[];
  }
  
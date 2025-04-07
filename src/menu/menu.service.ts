// menu.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

export interface Menu {
  id: number;
  title?: string;
  branchId: number;
  items?: CreateMenuDto['items'];
}

@Injectable()
export class MenuService {
  // Простой in-memory репозиторий для демонстрации
  private menus: Menu[] = [];
  private idCounter = 1;

  create(createMenuDto: CreateMenuDto): Menu {
    const newMenu: Menu = {
      id: this.idCounter++,
      ...createMenuDto,
    };
    this.menus.push(newMenu);
    return newMenu;
  }

  findAll(): Menu[] {
    return this.menus;
  }

  findOne(id: number): Menu {
    const menu = this.menus.find((m) => m.id === id);
    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
    return menu;
  }

  update(id: number, updateMenuDto: UpdateMenuDto): Menu {
    const index = this.menus.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
    const updatedMenu = { ...this.menus[index], ...updateMenuDto };
    this.menus[index] = updatedMenu;
    return updatedMenu;
  }

  remove(id: number): Menu {
    const index = this.menus.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
    const [removedMenu] = this.menus.splice(index, 1);
    return removedMenu;
  }
}

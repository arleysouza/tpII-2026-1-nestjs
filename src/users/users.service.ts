import { Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { users } from './users.schema';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const [user] = await this.databaseService.db
      .insert(users)
      .values({
        name: createUserDto.name,
        email: createUserDto.email ?? null,
      })
      .returning();

    return user;
  }

  findAll() {
    return this.databaseService.db
      .select()
      .from(users)
      .orderBy(asc(users.idUser));
  }

  async findOne(id: number) {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.idUser, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`Usuario ${id} nao encontrado.`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.findOne(id);

    const [user] = await this.databaseService.db
      .update(users)
      .set({
        name: updateUserDto.name ?? existingUser.name,
        email:
          updateUserDto.email !== undefined
            ? updateUserDto.email || null
            : existingUser.email,
      })
      .where(eq(users.idUser, id))
      .returning();

    return user;
  }

  async remove(id: number) {
    const deletedUsers = await this.databaseService.db
      .delete(users)
      .where(eq(users.idUser, id))
      .returning({ idUser: users.idUser });

    if (!deletedUsers.length) {
      throw new NotFoundException(`Usuario ${id} nao encontrado.`);
    }

    return {
      message: 'Usuario removido com sucesso.',
    };
  }
}

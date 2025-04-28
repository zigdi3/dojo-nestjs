import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    // Verificar se o email já existe
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await this.hashPassword(password);

    // Criar o usuário
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificar se o usuário existe
    await this.findOne(id);

    // Hashear a senha se for fornecida
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    // Verificar se o usuário existe
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}

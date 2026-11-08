import { HttpStatus, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
//import { Order } from '../generated/prisma/browser';



@Injectable()
export class OrdersService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  private readonly logger = new Logger("OrdersService");

  constructor(
  ) {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Database connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      return await this.order.create({
        data: createOrderDto
      });
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: (error as Error).message,
      });
    }
  }

  async findAll() {
    const Alls = await this.order.findMany();
    return Alls;
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({ where: { id } });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found.`

      })
    }

    return order;
  }

}

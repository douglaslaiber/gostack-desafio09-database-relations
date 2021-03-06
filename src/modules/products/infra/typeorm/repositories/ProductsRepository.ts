import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const ProductIds: string[] = products.map(product => product.id);

    const productsFound = await this.ormRepository.findByIds(ProductIds);

    return productsFound;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsToUpdate: Product[] = [];

    await Promise.all(
      products.map(async product => {
        const productFound = await this.ormRepository.findOne(product.id);
        if (productFound) {
          productFound.quantity = product.quantity;
          productsToUpdate.push(productFound);
        }

        return productFound;
      }),
    );

    const updatedProducts = await this.ormRepository.save(productsToUpdate);

    return updatedProducts;
  }
}

export default ProductsRepository;

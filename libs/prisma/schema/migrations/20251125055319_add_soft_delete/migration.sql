/*
  Warnings:

  - You are about to drop the column `productId` on the `baskets` table. All the data in the column will be lost.
  - Made the column `reason` on table `stock_movements` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "basket_items" DROP CONSTRAINT "basket_items_basketId_fkey";

-- DropForeignKey
ALTER TABLE "baskets" DROP CONSTRAINT "baskets_productId_fkey";

-- DropForeignKey
ALTER TABLE "baskets" DROP CONSTRAINT "baskets_userId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "basket_items" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "quantity" DROP DEFAULT;

-- AlterTable
ALTER TABLE "baskets" DROP COLUMN "productId",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "quantity" DROP DEFAULT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "reason" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "baskets" ADD CONSTRAINT "baskets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "baskets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

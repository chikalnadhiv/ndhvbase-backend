-- AlterTable
ALTER TABLE "PreparationStep" ADD COLUMN     "time" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "details" TEXT;

-- AlterTable
ALTER TABLE "VendorAssignment" ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DetailTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DetailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingItem" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItemDetails" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ItemDetails_AB_unique" ON "_ItemDetails"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemDetails_B_index" ON "_ItemDetails"("B");

-- AddForeignKey
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemDetails" ADD CONSTRAINT "_ItemDetails_A_fkey" FOREIGN KEY ("A") REFERENCES "DetailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemDetails" ADD CONSTRAINT "_ItemDetails_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

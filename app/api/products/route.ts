import { connectToDatabase } from "@/lib/db"; // keep this if your file is db.ts
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    let query: any = {};

    if (q) {
      query = {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } },
          { tags: { $regex: q, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(query).lean();

    const formattedProducts = products.map((product: any) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      ecoScore: product.ecoScore ?? 0,
      image: product.image,
      inStock: product.inStock,
      brand: product.brand ?? "Unknown",
      tags: product.tags ?? [],
    }));

    return NextResponse.json(formattedProducts);
  } catch (error: any) {
    console.error("❌ REAL ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message,
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}
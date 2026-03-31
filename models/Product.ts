import mongoose, { Schema, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      default: "general",
    },
    image: {
      type: String,
      default: "",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    ecoScore: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
      default: "Unknown",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Full-text search index
ProductSchema.index({
  name: "text",
  description: "text",
  tags: "text",
  category: "text",
});

// ✅ Prevent model overwrite error (VERY IMPORTANT in Next.js)
const Product =
  models.Product || mongoose.model("Product", ProductSchema);

export default Product;
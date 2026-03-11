import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../../services/recipes";

export function registerRecipeTools(server: McpServer) {
  server.tool(
    "list_recipes",
    "List recipes with optional search, filtering, and pagination",
    {
      q: z.string().optional().describe("Search query for recipe title"),
      limit: z.number().int().min(1).max(100).optional().describe("Number of results (default 20)"),
      offset: z.number().int().min(0).optional().describe("Offset for pagination"),
    },
    async (params) => {
      const recipes = await listRecipes(params);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(recipes, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_recipe",
    "Get a recipe by ID with all ingredients and instructions",
    {
      id: z.number().int().describe("Recipe ID"),
    },
    async ({ id }) => {
      const recipe = await getRecipe(id);
      if (!recipe) {
        return {
          content: [{ type: "text" as const, text: "Recipe not found" }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(recipe, null, 2) }],
      };
    },
  );

  server.tool(
    "create_recipe",
    "Create a new recipe with ingredients and instructions",
    {
      title: z.string().min(1).max(255).describe("Recipe title"),
      description: z.string().optional().describe("Brief description"),
      prepTime: z.number().int().min(0).optional().describe("Prep time in minutes"),
      cookTime: z.number().int().min(0).optional().describe("Cook time in minutes"),
      totalTime: z.number().int().min(0).optional().describe("Total time in minutes"),
      servings: z.string().optional().describe("Servings (e.g. '4', '2-3')"),
      source: z.string().optional().describe("Source name (e.g. 'Grandma')"),
      sourceUrl: z.string().url().optional().describe("Source URL"),
      imageUrl: z.string().url().optional().describe("Image URL"),
      notes: z.string().optional().describe("Additional notes"),
      ingredients: z
        .array(
          z.object({
            sortOrder: z.number().int().min(0).describe("Sort order"),
            group: z.string().optional().describe("Ingredient group (e.g. 'For the dough')"),
            amount: z.string().optional().describe("Amount (e.g. '1', '1/2')"),
            unit: z.string().optional().describe("Unit (e.g. 'cup', 'tbsp')"),
            item: z.string().describe("Ingredient name"),
            notes: z.string().optional().describe("Ingredient notes (e.g. 'diced')"),
          }),
        )
        .optional()
        .describe("List of ingredients"),
      instructions: z
        .array(
          z.object({
            stepNumber: z.number().int().min(1).describe("Step number"),
            group: z.string().optional().describe("Instruction group"),
            text: z.string().describe("Instruction text"),
          }),
        )
        .optional()
        .describe("List of instructions"),
    },
    async (params) => {
      const recipe = await createRecipe(params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(recipe, null, 2) }],
      };
    },
  );

  server.tool(
    "update_recipe",
    "Update an existing recipe. Only provided fields are updated. Ingredients/instructions use replace strategy.",
    {
      id: z.number().int().describe("Recipe ID to update"),
      title: z.string().min(1).max(255).optional().describe("Recipe title"),
      description: z.string().optional().describe("Brief description"),
      prepTime: z.number().int().min(0).optional().describe("Prep time in minutes"),
      cookTime: z.number().int().min(0).optional().describe("Cook time in minutes"),
      totalTime: z.number().int().min(0).optional().describe("Total time in minutes"),
      servings: z.string().optional().describe("Servings"),
      source: z.string().optional().describe("Source name"),
      sourceUrl: z.string().url().optional().describe("Source URL"),
      imageUrl: z.string().url().optional().describe("Image URL"),
      notes: z.string().optional().describe("Additional notes"),
      ingredients: z
        .array(
          z.object({
            sortOrder: z.number().int().min(0),
            group: z.string().optional(),
            amount: z.string().optional(),
            unit: z.string().optional(),
            item: z.string(),
            notes: z.string().optional(),
          }),
        )
        .optional()
        .describe("Replace all ingredients"),
      instructions: z
        .array(
          z.object({
            stepNumber: z.number().int().min(1),
            group: z.string().optional(),
            text: z.string(),
          }),
        )
        .optional()
        .describe("Replace all instructions"),
    },
    async ({ id, ...params }) => {
      const recipe = await updateRecipe(id, params);
      if (!recipe) {
        return {
          content: [{ type: "text" as const, text: "Recipe not found" }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(recipe, null, 2) }],
      };
    },
  );

  server.tool(
    "delete_recipe",
    "Delete a recipe by ID",
    {
      id: z.number().int().describe("Recipe ID to delete"),
    },
    async ({ id }) => {
      const deleted = await deleteRecipe(id);
      if (!deleted) {
        return {
          content: [{ type: "text" as const, text: "Recipe not found" }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: "Recipe deleted successfully" }],
      };
    },
  );
}

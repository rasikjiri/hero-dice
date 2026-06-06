import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  const { data, error } =
    await supabase
      .from("games")
      .insert([
        {
          date: new Date().toISOString(),
          winner: "test",
          winner_score: 999,
          players: ["test1", "test2"],
          scores: [],
        },
      ])
      .select();

  console.log(
    "SUPABASE TEST",
    data,
    error
  );
}

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("cerrar")
    .setDescription("Anuncia que el servidor está cerrado"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("⛔ 🇲🇽 MÉXICO RP 🇲🇽 – SERVIDOR CERRADO ⛔")
      .setDescription("📢 **Estimados ciudadanos:**\n\nEl servidor se encuentra actualmente cerrado. ❌")
      .setColor(0xD83A56)
      .addFields(
        { name: "🕓 Estado del Servidor", value: "❌ Cerrado temporalmente" },
        { name: "📌 Recordatorio", value: "🤝 Sigue las reglas del rol\n🔔 Mantente atento a la reapertura" }
      )
      .setFooter({ text: "México RP • Servidor cerrado • 2025" });

    await interaction.reply({ embeds: [embed] });
  },
};

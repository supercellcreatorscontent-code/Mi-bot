import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("abrir")
    .setDescription("Anuncia que el servidor está abierto"),

  async execute(interaction) {
    let link = "https://www.roblox.com/share?code=4dcccbf839236947810498858ad7f772&type=Server";
    if (fs.existsSync("./link.json")) {
      const data = JSON.parse(fs.readFileSync("./link.json", "utf8"));
      if (data.link) link = data.link;
    }

    const embed = new EmbedBuilder()
      .setTitle("🏙️🇲🇽 MÉXICO RP 🇲🇽 ¡YA ESTÁ ABIERTO! 🏙️")
      .setDescription(`📢 **Estimados ciudadanos:**\n\nNos complace anunciar que **el servidor oficial de 🇲🇽 México RP 🇲🇽 ya está abierto** y listo para recibir a todos los jugadores.\n\n🔗 **ÚNETE AHORA:** [Haz clic aquí para unirte](${link})`)
      .setColor(0xFFA500)
      .addFields(
        { name: "🕓 Estado del Servidor", value: "✅ Abierto y listo para todos los jugadores" },
        { name: "📌 Recomendaciones", value: "🤝 Mantén el respeto\n📜 Sigue las reglas del rol\n🎉 Disfruta la experiencia al máximo" }
      )
      .setFooter({ text: "Attentamente | 🇲🇽 México RP 🇲🇽" });

    await interaction.reply({ embeds: [embed] });
  },
};

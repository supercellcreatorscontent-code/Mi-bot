import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import "dotenv/config";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();

const commandsArray = [];

// Cargar comandos
const commandFiles = fs.readdirSync("./comandos").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = await import(`./comandos/${file}`);
  client.commands.set(command.default.data.name, command.default);
  commandsArray.push(command.default.data.toJSON());
}

// Funciones para manejar warns
const archivoWarns = "./warns.json";
function cargarWarns() {
  if (!fs.existsSync(archivoWarns)) fs.writeFileSync(archivoWarns, "{}");
  return JSON.parse(fs.readFileSync(archivoWarns, "utf-8"));
}
function guardarWarns(data) {
  fs.writeFileSync(archivoWarns, JSON.stringify(data, null, 2));
}

client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // Reaplicar mutes pendientes
  const warns = cargarWarns();
  const guild = client.guilds.cache.first(); // o especifica tu ID si quieres
  const muteRole = guild.roles.cache.find(r => r.name === "Muted");

  for (const userId in warns) {
    for (const w of warns[userId]) {
      if (w.accion === "mute") {
        const fin = new Date(w.finAccion);
        if (fin > new Date()) {
          const member = await guild.members.fetch(userId).catch(() => null);
          if (member && !member.roles.cache.has(muteRole.id)) member.roles.add(muteRole);
          // Programar quitar mute
          setTimeout(() => {
            guild.members.fetch(userId).then(m => m.roles.remove(muteRole)).catch(() => {});
          }, fin - new Date());
        }
      }
    }
  }
});

// Manejar interacciones de comandos (igual que antes)
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const member = interaction.member;
  const rolesPermitidos = ["STAFF", "ADMINISTRADOR"];
  if (!member.permissions.has("Administrator") && !member.roles.cache.some(r => rolesPermitidos.includes(r.name))) {
    return interaction.reply({ content: "❌ No tienes permisos para usar este comando.", ephemeral: true });
  }

  try {
    await command.execute(interaction, { cargarWarns, guardarWarns, client });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ Error al ejecutar el comando.", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
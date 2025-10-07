import { Client, GatewayIntentBits, Collection, REST, Routes } from "discord.js";
import fs from "fs";
import "dotenv/config";

// --------------------
// Configuración del bot
// --------------------
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.commands = new Collection();
const commandsArray = [];

// --------------------
// Cargar comandos automáticamente
// --------------------
const commandFiles = fs.readdirSync("./comandos").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  try {
    const commandModule = await import(`./comandos/${file}`);
    const command = commandModule.default;

    if (!command || !command.data || !command.execute) {
      console.warn(`⚠️ El comando "${file}" no tiene 'data' o 'execute'. Se omitirá.`);
      continue;
    }

    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
    console.log(`✅ Comando cargado: ${command.data.name}`);
  } catch (err) {
    console.error(`❌ Error al cargar el comando "${file}":`, err);
  }
}

// --------------------
// Sistema de warns
// --------------------
const archivoWarns = "./warns.json";

function cargarWarns() {
  if (!fs.existsSync(archivoWarns)) fs.writeFileSync(archivoWarns, "{}");
  return JSON.parse(fs.readFileSync(archivoWarns, "utf-8"));
}

function guardarWarns(data) {
  fs.writeFileSync(archivoWarns, JSON.stringify(data, null, 2));
}

// --------------------
// Cuando el bot está listo
// --------------------
client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // Registrar comandos en el servidor (inmediato)
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, "1423316216008675462"), // tu ID de servidor
      { body: commandsArray }
    );
    console.log("✅ Comandos registrados correctamente en el servidor.");
  } catch (error) {
    console.error("❌ Error al registrar comandos:", error);
  }

  // Reaplicar mutes pendientes
  const warns = cargarWarns();
  const guild = client.guilds.cache.get("1423316216008675462");
  if (!guild) return;

  const muteRole = guild.roles.cache.find(r => r.name === "Muted");
  if (!muteRole) return;

  for (const userId in warns) {
    for (const w of warns[userId]) {
      if (w.accion === "mute") {
        const fin = new Date(w.finAccion);
        if (fin > new Date()) {
          const member = await guild.members.fetch(userId).catch(() => null);
          if (member && !member.roles.cache.has(muteRole.id)) member.roles.add(muteRole);
          setTimeout(() => {
            guild.members.fetch(userId)
              .then(m => m.roles.remove(muteRole))
              .catch(() => {});
          }, fin - new Date());
        }
      }
    }
  }
});

// --------------------
// Manejo de interacciones (slash commands)
// --------------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, { client, cargarWarns, guardarWarns });
  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      await interaction.reply({ content: "❌ Error al ejecutar el comando.", ephemeral: true });
    }
  }
});

// --------------------
// Login del bot
// --------------------
client.login(process.env.TOKEN);
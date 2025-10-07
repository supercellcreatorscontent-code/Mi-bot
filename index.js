import { Client, GatewayIntentBits, Collection, REST, Routes } from "discord.js";
import fs from "fs";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
const commandsArray = [];

// 📂 Cargar comandos automáticamente desde /comandos
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

// 📁 Archivo de warns
const archivoWarns = "./warns.json";

function cargarWarns() {
  if (!fs.existsSync(archivoWarns)) fs.writeFileSync(archivoWarns, "{}");
  return JSON.parse(fs.readFileSync(archivoWarns, "utf-8"));
}

function guardarWarns(data) {
  fs.writeFileSync(archivoWarns, JSON.stringify(data, null, 2));
}

// 🚀 Cuando el bot está listo
client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // 🔁 Registrar comandos automáticamente
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      // 👉 Si quieres que los comandos solo estén en un servidor específico:
      // Routes.applicationGuildCommands(client.user.id, "ID_DE_TU_SERVIDOR"),
      Routes.applicationCommands(client.user.id),
      { body: commandsArray }
    );
    console.log("✅ Comandos registrados correctamente.");
  } catch (error) {
    console.error("❌ Error al registrar comandos:", error);
  }

  // 🔁 Reaplicar mutes pendientes
  const warns = cargarWarns();
  const guild = client.guilds.cache.first();
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

// 🎯 Manejo de interacciones (slash commands)
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const member = interaction.member;
  const rolesPermitidos = ["STAFF", "ADMINISTRADOR"];
  if (!member.permissions.has("Administrator") &&
      !member.roles.cache.some(r => rolesPermitidos.includes(r.name))) {
    return interaction.reply({
      content: "❌ No tienes permisos para usar este comando.",
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction, { cargarWarns, guardarWarns, client });
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "❌ Error al ejecutar el comando.",
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
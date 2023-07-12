import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();
console.log("Bot starting .....")

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

client.on("messageCreate", async function (message) {
    if (message.author.bot) return;

    try {
      const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
              {role: "system", content: "You are a helpful assistant who responds succinctly"},
              {role: "user", content: message.content}
          ],
        });

      const content = response.data.choices[0].message;
      console.log(content);

      // Fix 2000 character discord limit
      if (content.length > 2000) {
        const chunks = content.match(/(.|[\r\n]){1,2000}/g);

        for (const chunk of chunks) {
          await message.channel.send(chunk);
        }
      } else {
        await message.channel.send(content);
      }
      
    } catch (err) {
      console.error(err);
      await message.reply(
        "Something when wrong! Contact Hung for more information"
      );
    }
  });

  client.login(process.env.BOT_TOKEN);
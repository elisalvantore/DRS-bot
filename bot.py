import os
import discord
from discord.ext import commands, tasks
from dotenv import load_dotenv
from flask import Flask
import threading

load_dotenv()
TOKEN = os.getenv("TOKEN")

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="d!", intents=intents)

@bot.event
async def on_ready():
    print(f"✅ Bot đã đăng nhập thành công với tên: {bot.user}")
    await bot.change_presence(activity=discord.Game("Đang chơi PUBG cùng DRS! ❤️"))

@bot.command()
async def ping(ctx):
    latency = round(bot.latency * 1000)
    await ctx.send(f"🏓 Pong! Ping: {latency}ms")

# Health check server
app = Flask(__name__)

@app.route("/")
def health():
    return "Bot is running!"

def run_flask():
    app.run(host="0.0.0.0", port=8000)

if __name__ == "__main__":
    threading.Thread(target=run_flask, daemon=True).start()
    bot.run(TOKEN)
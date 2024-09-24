import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import OpenAI from "openai";
import { Twilio } from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

const client = new Twilio(accountSid, authToken);
const openai = new OpenAI();

const app = express();
const PORT =  '3001';

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/whatsapp', async (req: Request, res: Response) => {
  const incomingMessage = req.body.Body;

  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
          { role: "system", content: "Você é um assistente virtual que irá responder a qualquer pergunta que eu coloque no WhatsApp." },
          {
              role: "user",
              content: incomingMessage,
          },
      ],
  });

    const chatGptReply = completion.choices[0].message;

    if(chatGptReply.content){
      await client.messages
      .create({
          body: chatGptReply.content,
          from: 'whatsapp:+14155238886',
          to: 'whatsapp:+556581751036'
      })

      res.status(200).send(`Mensagem processada com sucesso`);
    }else {
      res.status(200).send('Nenhuma mensagem para enviar');
    }

  } catch (error) {
    console.error('Erro ao conectar com a OpenAI ou Twilio:', error);
    res.status(500).send('Erro ao processar a mensagem');
  }
});

// Iniciar o servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

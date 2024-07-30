import express from 'express';
import cors from 'cors';
import amqp from 'amqplib';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import AWS from 'aws-sdk';

// AWS region and Lambda function configuration
const region = "us-east-2";
const lambdaFunctionName = "fetchSecretsFunction_gr8";

// Function to invoke Lambda and fetch secrets
async function getSecretFromLambda() {
  const lambda = new AWS.Lambda({ region: region });
  const params = {
    FunctionName: lambdaFunctionName,
  };

  try {
    const response = await lambda.invoke(params).promise();
    const payload = JSON.parse(response.Payload);
    if (payload.errorMessage) {
      throw new Error(payload.errorMessage);
    }
    const body = JSON.parse(payload.body);
    return JSON.parse(body.secret);
  } catch (error) {
    console.error('Error invoking Lambda function:', error);
    throw error;
  }
}

// Function to start the service
async function startService() {
  let secrets;
  try {
    secrets = await getSecretFromLambda();
  } catch (error) {
    console.error(`Error starting service: ${error}`);
    return;
  }

  AWS.config.update({
    region: region,
    accessKeyId: secrets.AWS_ACCESS_KEY_ID,
    secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
  });

  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const app = express();
  const port = 8088;

  app.use(cors());
  app.use(express.json());

  // Swagger setup
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Update Category Service API',
        version: '1.0.0',
        description: 'API for updating categories'
      }
    },
    apis: ['./src/index.js']
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // RabbitMQ setup
  let channel;
  async function connectRabbitMQ() {
    try {
      const connection = await amqp.connect('amqp://3.136.72.14:5672/');
      channel = await connection.createChannel();
      await channel.assertQueue('category-events', { durable: true });
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
    }
  }

  // Publish event to RabbitMQ
  const publishEvent = async (eventType, data) => {
    const event = { eventType, data };
    try {
      if (channel) {
        channel.sendToQueue('category-events', Buffer.from(JSON.stringify(event)), { persistent: true });
        console.log('Event published to RabbitMQ:', event);
      } else {
        console.error('Channel is not initialized');
      }
    } catch (error) {
      console.error('Error publishing event to RabbitMQ:', error);
    }
  };

  await connectRabbitMQ();

  /**
   * @swagger
   * /categories/{name}:
   *   put:
   *     summary: Update an existing category
   *     description: Update an existing category by name
   *     parameters:
   *       - in: path
   *         name: name
   *         required: true
   *         description: Name of the category to update
   *         schema:
   *           type: string
   *     requestBody:
   *       description: Category object that needs to be updated
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nameCategory:
   *                 type: string
   *                 example: "New Electronics"
   *     responses:
   *       200:
   *         description: Category updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       404:
   *         description: Category not found
   *       500:
   *         description: Error updating category
   */
  app.put('/categories/:name', async (req, res) => {
    const { name } = req.params;
    const { nameCategory } = req.body;

    const params = {
      TableName: 'Categories_gr8',
      Key: { name },
      UpdateExpression: 'set nameCategory = :nameCategory',
      ExpressionAttributeValues: {
        ':nameCategory': nameCategory
      },
      ReturnValues: 'UPDATED_NEW'
    };

    try {
      const result = await dynamoDB.update(params).promise();
      const updatedCategory = {
        name: name,
        nameCategory: nameCategory,
      };
      publishEvent('CategoryUpdated', updatedCategory);
      res.send({ message: 'Category updated', result });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).send({ message: 'Error updating category', error });
    }
  });

  app.get('/', (req, res) => {
    res.send('Update Category Service Running');
  });

  app.listen(port, () => {
    console.log(`Update Category service listening at http://localhost:${port}`);
  });
}

startService();

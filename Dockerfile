# Development build
FROM node:22 AS build

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS app
RUN npm run build

# ------------------------------
# Production image
FROM node:22

WORKDIR /usr/src/app

# Set environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy compiled dist from build stage
COPY --from=build /usr/src/app/dist ./dist

# Copy generated Prisma client from build stage
COPY --from=build /usr/src/app/generated ./generated

# Copy only necessary files for production
COPY --from=build /usr/src/app/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Remove package*.json to reduce image size
RUN rm package*.json

EXPOSE 3000

CMD ["node", "dist/main"]

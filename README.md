# Update Category Service

This is the microservice for create a update category in the +Kotas App.

## Group Members

- Christopher Pallo
- Brayan Dávila

## Table of Contents

1. [Microservice Description](#microservice-description)
2. [Installation](#installation)
   - [Requirements](#requirements)
   - [Clone the Repository](#clone-the-repository)
   - [Install Dependencies](#install-dependencies)
   - [Start the Server](#start-the-server)
   - [Evidence](#evidence)
3. [Usage](#usage)
   - [Verify Server Functionality](#verify-server-functionality)


## Microservice Description

The `create-category-service` microservice is responsible for managing the list of users in the +kotas App. Allows you to list products using an HTTP PUT request to the corresponding route.

## Installation

### Requirements

- Node.js
- npm (Node Package Manager)

### Clone the Repository

```sh
https://github.com/ChristopherPalloArias/gr8-update-category-service.git
cd create-category-service
```

### Install Dependencies
```sh
npm install
```

### Starting the Server
Before starting the application you must change the database credentials in the index.js file if you want to use the application locally and independently, this is because initially the application is configured to be used in conjunction with the rest of Microservices.
Repository: [https://github.com/ChristopherPalloArias/kotas-frontend](https://github.com/ChristopherPalloArias/kotas-frontend.git)

### Evidence
![image](https://github.com/user-attachments/assets/97ea0fe5-a975-46ab-8470-46d61dc03316)


## Usage
### Verify Server Functionality

Method: PUT  
URL: `gr8-load-balancer-category-1676330872.us-east-2.elb.amazonaws.com:8088`  
Description: This route displays a message to verify that the server is running.
![image](https://github.com/user-attachments/assets/d762315c-24b0-42f3-9e51-3282a5a669e6)



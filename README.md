# Fullstack Interview Challenge

> [!IMPORTANT]
> You should have received a google doc together with this repository that explains in detail the scope and context of the exercise, together with it's acceptance criteria and any other necessary information for the completion of the challenge.

## Context

You are working in the product team at eversports that is maintaining the eversports manager. You and your team are working on a bunch of features around memberships within the current quarter.

The team also started an initiative in this quarter to modernize the codebase by refactoring features implemented in an old technology stack to a more modern one.  

### Domain: Memberships

A `Membership` allows a user to participate at any class the a specific sport venue within a specific timespan. Within this timespan, the membership is divided into `MembershipPeriods`. The MembershipPeriods represent billing periods that the user has to pay for.

For the scope of this exercise, the domain model was reduced to a reasonable size. 

#### Entity: Membership
```ts
interface Membership {
    name: string // name of the membership
    user: number // the user that the membership is assigned to
    recurringPrice: number // price the user has to pay for every period
    validFrom: Date // start of the validity
    validUntil: Date // end of the validity
    state: string // indicates the state of the membership
    paymentMethod: string // which payment method will be used to pay for the periods
    billingInterval: string // the interval unit of the periods
    billingPeriods: number // the number of periods the membership has
}
```

#### Entity: MembershipPeriod
```ts
interface MembershipPeriod {
    membership: number // membership the period is attached to
    start: Date // indicates the start of the period
    end: Date // indicates the end of the period
    state: string
}
```


## Task 1 - Modernization of the membership codebase (backend only)

Before your team can start to implement new features, you guys decided to **modernize the backend codebase** first.

Your task is to **refactor two endpoints** implemented in the **legacy codebase** that can be used to list and create memberships:

GET /legacy/memberships (`src/legacy/routes/membership.routes.js`)
POST /legacy/memberships (`src/legacy/routes/membership.routes.js`)

Your new implementation should be accessible through new endpoints in the **modern codebase** that are already prepared:

GET /memberships (`src/modern/routes/membership.routes.ts`)
POST /memberships (`src/modern/routes/membership.routes.ts`)

When refactoring, you should consider the following aspects:

- The response from the endpoints should be exactly the same. Use the same error messages that are used in the legacy implementation.
- You write read- and maintainable code
- You use Typescript instead of Javascript to enabled type safety
- Your code is separated based on concerns
- Your code is covered by automated tests to ensure the stability of the application

> [!NOTE]
> For the scope of this task, the data used is mocked within the json files `membership.json` and `membership-periods.json`

> [!NOTE]
> We provided you with a clean express.js server to run the example. For your implementations, feel free to use any library out there to help you with your solution. If you decide to choose another JavaScript/TypeScript http library/framework (eg. NestJs) update the run config described below if needed, and ensure that the routes of the described actions don't change.

## Task 1 Assumptions and decisions:
#### 1. Generation of UUIDS
Even though this was just a exercise, I preferred `crypto.randomUUID()`  because it is more preferred to generate cryptographically stronger UUIDs.
It is also built-in in  modern web browsers and therefore no need to additional installations,

#### 2.Persistence of data
Persistence in a database is out of scope for this challenge, but the approach adopted (use of repositories, and interfaces) makes it easy to adopt databases.
The 2 available json files `memberships.json` and `membership-periods.json` are used in the `modern` endpoints just for seed but we are not writing additional content to them.

#### 3. Modified types
In an effort to reconcile the data inside the json files, I made some edits to the types 

```ts
interface Membership {
id: number; // unique identifier
uuid: string; // universally unique identifier
name: string; // name of the membership
userId: number; // the user that the membership is assigned to
recurringPrice: number; // price the user has to pay for every period
validFrom: Date; // start of the validity
validUntil: Date; // end of the validity
state: string; // indicates the state of the membership
paymentMethod: string | null; // which payment method will be used to pay for the periods
billingInterval: string; // the interval unit of the periods
billingPeriods: number; // the number of periods the membership has
assignedBy?: string; // who assigned the membership
}
```
Additional assumptions and decisions are available through out the entire changes as co-located comments.


## Task 2 - Design an architecture to provide a membership export (conception only)

The team discovered that users are interested in **exporting all of their memberships** from the system to run their own analysis once a month as a **CSV file**. Because the creation of the export file would take some seconds, the team decided to go for an **asynchronous process** for creating the file and sending it via email. The process will be triggered by an API call of the user. 

Your task is to **map out a diagram** that visualizes the asynchronous process from receiving the request to sending the export file to the user. This diagram should include all software / infrastructure components that will be needed to make the process as stable and scalable as possible. 

Because the team has other things to work on too, this task is timeboxed to **1 hour** and you should share the architecture diagram as a **PDF file**.

## Task 2 solution
Please refer to a pdf document contained in the root folder named `membership-csv-export.pdf`

## Components & Software
1. **Client:** The user who initiates the export request.
2. **API Gateway (AWS Gateway):** This is the entry point for the export request.  It receives the request from the client and routes it to the appropriate service.
3. **Message Queue (RabbitMQ):** I'm using a message broker to decouple the request handling from the actual CSV generation.  The API Gateway places export jobs in the queue.
4. **Worker Service (EC2 Instance):** This service consumes the export jobs from the message queue.  It performs the following tasks:

> * Retrieves the necessary data from the Postgres database.
> * Generates the CSV file.
> * Stores the CSV file in an AWS S3 Bucket.
> * Uses SendGrid and an Email Service(EC2 Instance) to sends an email to the user with a link to download the CSV file.

5. **Postgres Database:** Sotrage of membership data is out of scope for this task (see task 1), but this db would hold the data.
6. **AWS S3 Bucket:** Object storage where the generated CSV files are stored.
7. **Email Service (EC2 Instance) & SendGrid:** Handles the sending of email notifications to the user, providing the download link.  SendGrid is used to facilitate email sending.

#### Workflow

> * The user initiates an export request through the client.
> * The request is received by the API Gateway (AWS Gateway).
> * The API Gateway routes the request to the RabbitMQ message queue.
> * The Worker Service retrieves the export job from the RabbitMQ queue.
> * The Worker Service queries the Postgres database to retrieve the data.
> * The Worker Service generates the CSV file and stores it in the AWS S3 Bucket.
> * The Worker Service uses the Email Service (EC2 Instance) & SendGrid to send an email to the user with a download link.
> * The user retrieves the exported CSV file from the AWS S3 Bucket using the provided link.
* > [!NOTE]
> Feel free to use any tool out there to create your diagram. If you are not familiar with such a tool, you can use www.draw.io. 

## Repository Intro
In this repository you will find an plain express.js server the exposes API endpoints to consumers. For this exercise, the API endpoints are not protected.

### Installation

```sh
npm install
```

### Usage

```sh
npm run start
```

### Running in development
> This allows for auto reload on saving changes
```sh
npm run dev
```

### Run test
```sh
npm run test
```

## 🗒️ Conditions

- You will have multiple days for the challenge, but most of our candidates spend around **8h to 10h** on this assignment.
- You should put your code in GitHub or GitLab/Bitbucket and send us the link to your repository where we can find the source code. That means no ZIP files.
- Please make sure to include any additional instructions in a readme in case you change something about the compilation or execution of the codebase.

## 💻 Technologies:

We believe that great developers are not bound to a specific technology set, but no matter their toolbox they are able to think critically about how to structure and design good code. For this exercise, we provided just a small and simple set of tools to run the a application and tests. Feel free to use any library out there to help you with your implementation.

### Pre-installed

- Express - https://expressjs.com/
- TypeScript - https://www.typescriptlang.org/
- Jest - https://jestjs.io/

Best of luck and looking forward to what you are able to accomplish! 🙂

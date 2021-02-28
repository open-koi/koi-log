# Koi Logs SDK
Koi is a network designed to reward and help to coordinate the creation of public data resources. Install the SDK to register your gateway to the network and begin receiving traffic awards when you contribute logging data.

## Implementation
The Koi gateway logging middleware can be implemented for express servers by adding the following three lines shown below:
```
// add koi integration
app.use(koiLogMiddleware);
app.get("/logs", koiLogsHelper);
koiLogsDailyTask() // start the daily log task
```

## Example 
Check test.ts for an example of implementation.

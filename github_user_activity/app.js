import https from 'https';
import fs from 'node:fs';

const username = process.argv[2];
const path = `${username}.json`;

if (!username) {
    console.error('Provide a valid GitHub username.');
    process.exit(1);
}

const urlOptions = {
    hostname: 'api.github.com',
    path: `/users/${username}/events`,
    headers: { 'User-Agent': 'node.js' }    // required for api
};

function fetchAPI() {
    https.get(urlOptions, (response) => {
        if (response.statusCode === 404) {
            console.error('User not found.');
            process.exit(1);
        }

        let data = '';
        response.on('data', (chunk) => { data += chunk })

        response.on('end', () => {
            let events = JSON.parse(data)
            
            // save res to cache 
            fs.writeFileSync(path, JSON.stringify({timestamp : Date.now(), data: events}));

            // apple filter by eventType if any
            if(process.argv[3]){events = events.filter(event => event.type === process.argv[3])};
            
            displayEvents(events);
            } 
        );
    })
};

function displayEvents(events) {
    for (const event of events) {    
        if (event.type === 'PushEvent') {
            console.log(`Pushed commits to ${event.repo.name}.`);
        }
        else if (event.type === 'IssueCommentEvent') {
            console.log(`Commented (${event.payload.issue.number}) on issue in ${event.repo.name} : ${event.payload.issue.title}`);
        }
        else if (event.type === 'PullRequestEvent') {
            if ( event.payload.action === 'closed' ) { console.log(`Closed PR in ${event.repo.name}.`); }
            else { console.log(`Opened/Closed PR in ${event.repo.name}.`); }
        }
        else if (event.type === 'WatchEvent') {
            console.log(`Starred ${event.repo.name}`)
        }
    }
};

function main() {
    if (fs.existsSync( path )){
        let cached_data = JSON.parse(fs.readFileSync( path, 'utf8' ));

        const diff = ( Date.now() ) - cached_data.timestamp;
        const fiveMinutes = 300000;      // in ms

        //debug
        // console.log('is fresh:', diff <= fiveMinutes);

        // retrieve cache if fresh
        if ( diff <= fiveMinutes ) { displayEvents(cached_data.data); console.log('cache hit') };
        
        // if stale - fetch and update from API
        if ( diff > fiveMinutes ) { fetchAPI() };

    } else { fetchAPI(); }
};

main();
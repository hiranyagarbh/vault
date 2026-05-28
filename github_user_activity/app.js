import https from 'https';

const username = process.argv[2];
if (!username) {
    console.error('Provide a valid GitHub username.');
    process.exit(1);
}

const urlOptions = {
    hostname: 'api.github.com',
    path: `/users/${username}/events`,
    headers: { 'User-Agent': 'node.js' }    // required for api
}

https.get(urlOptions, (response) => {
    if (response.statusCode === 404) {
        console.error('User not found.');
        process.exit(1);
    }

    let data = '';
    response.on('data', (chunk) => { data += chunk })

    response.on('end', () => {
        let events = JSON.parse(data)
        
        if(process.argv[3]){events = events.filter(event => event.type === process.argv[3])};   //filter by eventType

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
    });

});

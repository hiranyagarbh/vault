## GitHub User Activity
#### Use GitHub API to fetch user activity and display it in the terminal.

## Requirements

The application should run from the command line, accept the GitHub username as an argument, fetch the user's recent activity using the GitHub API, and display it in the terminal. The user should be able to:

#### Provide the GitHub username as an argument when running the CLI.

````
github-activity <username>
````

#### Fetch the recent activity of the specified GitHub user using the GitHub API. You can use the following endpoint to fetch the user's activity:

````
# https://api.github.com/users/<username>/events
````

#### Display the fetched activity in the terminal.

Output:

Update: (https://github.blog/changelog/2025-08-08-upcoming-changes-to-github-events-api-payloads/)
````
- Pushed 3̶ commits to kamranahmedse/developer-roadmap
- Opened a new issue in kamranahmedse/developer-roadmap
- Starred kamranahmedse/developer-roadmap
- ...
````

#### Note:

- Handle errors gracefully, such as invalid usernames or API failures.
- Use a programming language of your choice to build this project.
- Do not use any external libraries or frameworks to fetch the GitHub activity.
- If you are looking to build a more advanced version of this project, you can consider adding features like filtering the activity by event type, displaying the activity in a more structured format, or caching the fetched data to improve performance. You can also explore other endpoints of the GitHub API to fetch additional information about the user or their repositories.
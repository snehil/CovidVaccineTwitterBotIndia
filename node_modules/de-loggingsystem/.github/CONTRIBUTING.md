# Contributing

So you’d like to add to this project, that’s great! There are a few steps you need to follow first:

1. Check out the [Project Description](https://github.com/srepollock/de-logger/wiki/project-description) page for what this project is working towards and why it’s important.
2. [Your Project](https://github.com/srepollock/de-logger/wiki/your-project)
3. Check out open [issues](https://github.com/srepollock/de-logger/issues) to see if any issues stand out that you'd like to tackle!

After you’ve read and followed these steps, now you’re ready to get to work!

**Please Note:** All participants in this project  are expected to uphold the [code of conduct](https://github.com/srepollock/de-logger/blob/master/.github/CODE_OF_CONDUCT.md).

## Branch

When branching to work on your new feature, or to work on a hotfix, please create a branch with the name:

`[feature/hotfix]/[your_branch_name]`

- Features are new addions (features) to the engine.
- Hotfixes are branched from master that address a breaking issue and need to be changed quick.

> Please use snake_case for branch naming with descriptive names.

## Documentation

The documentation for the project is built using TypeDocs on Travis-CI and use the JSDoc format. For all project comments, please follow [JSDocumetation standards](http://usejsdoc.org/about-getting-started.html).

## Conventions

The project will run linting checks based on the [TSLint file](https://github.com/srepollock/de-logger/blob/master/tslint.json) found in the root directory. Lint checks are run each `npm run commit` and run each TravisCI run as well (to ensure that coding is consistant and reliable).

## Bracket Conventions

For bracket conventions, this project will use the [K&R indentation styles](https://en.wikipedia.org/wiki/Indentation_style#K&R).

## Naming Conventions

```ts
/// Imports
export class BaseClass {
    // Variables
    public static publicStatic: string;
    ...
    private static _privateStatic: string;
    ...
    public publicVariable: string;
    ...
    private _privateVariable: string;
    ...
    // Getters/Setters
    public get variable(): string { return this._privateVariable; }
    public set variable(s: string) { this._privateVariable = s; }
    ...
    // Methods
    constructor() {}
    public static publicStaticMethod(): void {}
    ...
    private static privateStaticMethod(): void {}
    ...
    public publicMethod(): void {}
    ...
    private privateMethod(): void {}
    ...
}
```

The feature name will be snake_case to verbosely explain the branch.

## Committing

Committing will be handled with an npm script. Simply run `npm run commit` and follow the prompts to get your commit working. If you've finished a feature, click the link output after the commit to start a pull request! If you've given a well documented commit message, you won't even have to give a pull request description!

## Issues

Issues are, well, an issue. Nobody want’s problems pointed out about a project they’ve worked so hard on, so why do I care so much about issues? I care because where there is an issue it’s normally 1 of 2 things.

1. They don’t understand what the project really is doing.
2. There is a problem with our code and we need to address it

With either issue there is always a solution, or one that can be coded. When submitting issues, there is a very simple guideline:

The more information you provide, the better equipped I will be to go about working on the issue. To follow up, please keep in contact with me on the issue, your findings (if any) and if you’d like to work on the issue yourself, simply fork the project and continue working there.
All issues are welcome, I just ask you please give information on what the issue is.

There are issue templates setup for the project. Please select one that is best suited for the issue you have.

## Pull Requests

Have you added a new feature that has been requested? Have you fixed an issue sitting on the [issues](https://github.com/srepollock/de-logger/issues) page? Have you fixed your own issue? Well now you want to submit a pull request I reckon. If that’s the case, you’ve come to the right place. The Sunset Engine has a few rules put in place to ensure quick pull requests for new features to test and develop. As long as you have been using `npm run commit` you will be setup to write a great pull request. Please try and be as descriptive as possible in your commit messages, as well as your pull requests for the best detail!

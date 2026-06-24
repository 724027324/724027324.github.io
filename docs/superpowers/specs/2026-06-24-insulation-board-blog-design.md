# Insulation Board Personal Blog Design

## Goal

Initialize this GitHub Pages repository as a personal blog about insulation board work, experience, field observations, and personal viewpoints.

The site should feel like a lightweight image-led personal publication rather than a corporate product site. It should support original photos taken by the author and make it easy to publish future posts from a browser-based admin screen.

## Audience

The primary audience is readers who care about practical insulation board experience: industry peers, clients who want to understand the author's judgment, and future collaborators evaluating the author's field knowledge.

## Chosen Direction

Use an image-first, minimalist editorial style:

- Personal photos should be visually prominent.
- Text should be restrained, readable, and focused on experience, observations, and viewpoints.
- The homepage should immediately signal the topic through insulation-board-related imagery and post titles.
- The site should avoid a marketing landing-page feel.

## Technical Approach

Use Astro with Decap CMS and GitHub Pages.

Astro will generate the static site. Decap CMS will provide an `/admin` editing interface where the author can create and edit posts and upload images. Posts will still be stored as Markdown files in the repository, and uploaded images will be stored in the repository under a public uploads directory.

This approach keeps hosting simple while providing a CMS workflow.

## Content Model

Blog posts should include:

- Title
- Publish date
- Summary
- Cover image
- Tags
- Body content in Markdown

Initial categories or tags can stay flexible, but the starter content should suggest directions such as field notes, material observations, project reflections, and personal viewpoints.

## Site Structure

The initialized site should include:

- Homepage with image-led hero area, latest posts, and a compact personal introduction.
- Blog listing page for all posts.
- Individual post pages with cover image, metadata, tags, and readable article layout.
- About page for the author's background and purpose.
- Decap CMS admin page at `/admin`.

## Assets

User-uploaded images should live under `public/uploads`. Starter placeholder visuals may be generated with CSS or local placeholder files, but the structure should be ready for real personal photos.

## Decap CMS Behavior

The CMS should manage the posts collection in `src/content/posts`. It should expose the post fields defined above and store media in `public/uploads`.

Authentication for Decap CMS on GitHub Pages requires GitHub-backed identity configuration. The project should include the CMS config and clear README notes explaining what must be configured in GitHub or an external auth provider before `/admin` can publish changes.

## Deployment

The repository is intended for GitHub Pages. The implementation should include a GitHub Actions workflow that builds Astro and deploys the generated static site to Pages.

## Testing And Verification

Before considering initialization complete:

- Install dependencies successfully.
- Run the project build.
- Run any available static checks.
- Verify the development site can start locally.
- Confirm CMS config files exist and point to the expected post and media paths.

## Out Of Scope For Initial Setup

- Paid or third-party cloud CMS.
- Self-hosted backend services.
- User accounts beyond Decap CMS publishing auth.
- Search, comments, newsletter signup, or analytics.
- Migrating real posts or photos unless the user provides them later.

---
title: Full-app embedding
redirect_from:
  - /docs/latest/enterprise-guide/full-app-embedding
---

# Full-app embedding

{% include plans-blockquote.html feature="Full-app embedding" %}

Metabase offers several [types of embedding](./introduction.md) with different levels of customization and security.

**Full-app embedding** is the only type of embedding that integrates with your [permissions](../permissions/introduction.md) and [SSO](../people-and-groups/start.md#authentication) to give people the right level of access to [query](https://www.metabase.com/glossary/query_builder) and [drill-down](https://www.metabase.com/learn/questions/drill-through) into your data.

If you only want to set up a fixed number of filters and drill-down views into your data (i.e., prevent people from creating their own [questions](https://www.metabase.com/glossary/question)), you might prefer [Signed embedding](./signed-embedding.md).

## Prerequisites

1. Make sure you have a [license token](../paid-features/activating-the-enterprise-edition.md) for a [paid plan](https://store.metabase.com/checkout/login-details).
2. Organize people into Metabase [groups](../people-and-groups/start.md).
3. Set up [permissions](../permissions/introduction.md) for each group.
4. Set up [SSO](../people-and-groups/start.md#authentication) to automatically apply permissions and show people the right data upon sign-in.

If you're dealing with a [multi-tenant](https://www.metabase.com/learn/customer-facing-analytics/multi-tenant-self-service-analytics) situation, check out our recommendations for [Configuring permissions for different customer schemas](https://www.metabase.com/learn/permissions/multi-tenant-permissions).

## Enabling full-app embedding in Metabase

1. Go to **Settings** > **Admin settings** > **Embedding**.
2. Click **Enable**.
3. Click **Full-app embedding**.
4. Under **Authorized origins**, add the URL of the website or web app where you want to embed Metabase (such as `https://*.example.com`).

## Setting up embedding on your website

1. Create an iframe with a `src` attribute set to:
   - the [URL](#pointing-an-iframe-to-a-metabase-url) of the Metabase page you want to embed, or
   - an [authentication endpoint](#pointing-an-iframe-to-an-authentication-endpoint) that redirects to your Metabase URL.
2. Optional: Depending on the way your web app is set up, set [environment variables](../configuring-metabase/environment-variables.md) to:
   - [Add your license token](../configuring-metabase/environment-variables.md#mb_premium_embedding_token).
   - [Embed Metabase in a different domain](#embedding-metabase-in-a-different-domain).
   - [Secure your full-app embed](#securing-full-app-embeds).
3. Optional: Enable communication to and from the embedded Metabase using supported [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) messages:
    - [From Metabase](#supported-postmessage-messages-from-embedded-metabase)
    - [To Metabase](#supported-postmessage-messages-to-embedded-metabase)
4. Optional: Set parameters to [show or hide Metabase UI components](#showing-or-hiding-metabase-ui-components).

Once you're ready to roll out your full-app embed, make sure that people **allow** browser cookies from Metabase, otherwise they won't be able to log in.

### Pointing an iframe to a Metabase URL

Go to your Metabase instance and find the page that you want to embed.

For example, to embed your Metabase home page, set the `src` attribute to your [site URL](../configuring-metabase/settings.md#site-url), such as:

`http://metabase.yourcompany.com/`

To embed a specific Metabase dashboard, use the dashboard's URL, such as:

`http://metabase.yourcompany.com/dashboard/1`

### Pointing an iframe to an authentication endpoint

Use this option if you want to send people directly to your SSO login screen (i.e., skip over the Metabase login screen with an SSO button), and redirect to Metabase automatically upon authentication.

You'll need to set the `src` attribute to your auth endpoint, with a parameter containing the encoded Metabase URL. For example, to send people to your SSO login page and automatically redirect them to `http://metabase.yourcompany.com/dashboard/1`:

```
https://metabase.example.com/auth/sso?redirect=http%3A%2F%2Fmetabase.yourcompany.com%2Fdashboard%2F1
```

If you're using [JWT](../people-and-groups/authenticating-with-jwt.md), you can use the relative path for the redirect (i.e., your Metabase URL without the [site URL](../configuring-metabase/settings.md#site-url)). For example, to send people to a Metabase page at `/dashboard/1`:

```
https://metabase.example.com/auth/sso?jwt=<token>&redirect=%2Fdashboard%2F1
```

You must URL encode (or double encode, depending on your web setup) all of the parameters in your redirect link, including parameters for filters (e.g., `filter=value`) and [UI settings](#showing-or-hiding-metabase-ui-components) (e.g., `top_nav=true`). For example, if you added two filter parameters to the JWT example shown above, your `src` link would become:

```
https://metabase.example.com/auth/sso?jwt=<token>&redirect=%2Fdashboard%2F1%3Ffilter1%3Dvalue%26filter2%3Dvalue
```

## Embedding Metabase in a different domain

If you want to embed Metabase in another domain (say, if Metabase is hosted at `metabase.yourcompany.com`, but you want to embed Metabase at `yourcompany.github.io`), set the following [environment variable](../configuring-metabase/environment-variables.md):

`MB_SESSION_COOKIE_SAMESITE=None`

If you set this environment variable to "None", you must use HTTPS in Metabase to prevent browsers from rejecting the request. For more information, see MDN's documentation on [SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite).

## Securing full-app embeds

Metabase uses HTTP cookies to authenticate people and keep them signed into your embedded Metabase, even when someone closes their browser session.

To limit the amount of time that a person stays logged in, set [`MAX_SESSION_AGE`](../configuring-metabase/environment-variables.md#max_session_age) to a number in minutes. The default value is 20,160 (two weeks).

For example, to keep people signed in for 24 hours at most:

`MAX_SESSION_AGE=1440`

To automatically clear a person's login cookies when they end a browser session:

`MB_SESSION_COOKIES=true`

To manually log someone out of Metabase, load the following URL (for example, in a hidden iframe on the logout page of your application):

`https://metabase.yourcompany.com/auth/logout`

If you're using [JWT](../people-and-groups/authenticating-with-jwt.md) for SSO, we recommend setting the `exp` (expiration time) property to a short duration (e.g., 1 minute).

## Supported postMessage messages _from_ embedded Metabase

To keep up with changes to an embedded Metabase URL (for example, when a filter is applied), set up your app to listen for "location" messages from the embedded Metabase. If you want to use this message for deep-linking, note that "location" mirrors "window.location".

```
{ “metabase”: { “type”: “location”, “location”: LOCATION_OBJECT_OR_URL }}
```

To make an embedded Metabase page (like a question) fill up the entire iframe in your app, set up your app to listen for a "frame" message with "normal" mode from Metabase:

```
{ “metabase”: { “type”: “frame”, “frame”: { “mode”: “normal” }}}
```

To specify the size of an iframe in your app so that it matches an embedded Metabase page (such as a dashboard), set up your app to listen for a "frame" message with "fit" mode from Metabase:

```
{ “metabase”: { “type”: “frame”, “frame”: { “mode”: “fit”, height: HEIGHT_IN_PIXELS }}}
```

## Supported postMessage messages _to_ embedded Metabase

To change an embedding URL, send a "location" message from your app to Metabase:

```
{ “metabase”: { “type”: “location”, “location”: LOCATION_OBJECT_OR_URL }}
```

## Showing or hiding Metabase UI components

To change the interface of your full-app embed, you can add parameters to the end of your embedding URL. If you want to change the colors or fonts in your embed, see [Customizing appearance](../configuring-metabase/appearance.md).

For example, you can disable Metabase's [top nav bar](#top_nav) and [side nav menu](#side_nav) like this:

`your_embedding_url?top_nav=false&side_nav=false`

![Top nav and side nav disabled](./images/no-top-no-side.png)

### top_nav

Hidden by default. To show the top navigation bar:

`top_nav=true`

![Top nav bar](./images/top-nav.png)

### search

Hidden by default. To show the search box in the top nav:

`top_nav=true&search=true`

### new_button

Hidden by default. To show the **+ New** button used to create queries or dashboards:

`top_nav=true&new_button=true`

### side_nav

The navigation sidebar is shown on `/collection` and home page routes, and hidden everywhere else by default.

To allow people to minimize the sidebar:

`top_nav=true&side_nav=true`

![Side nav](./images/side-nav.png)

### header

Visible by default on question and dashboard pages.

To hide a question or dashboard's title, [additional info](#additional_info), and [action buttons](#action_buttons):

`header=false`

### additional_info

Visible by default on question and dashboard pages, when the [header](#header) is enabled.

To hide the gray text “Edited X days ago by FirstName LastName”, as well as the breadcrumbs with collection, database, and table names:

`header=false&additional_info=false`

![Additional info](./images/additional-info.png)

### action_buttons

Visible by default on question pages when the [header](#header) is enabled.

To hide the action buttons such as **Filter**, **Summarize**, the query builder button, and so on:

`header=false&action_buttons=false`

![Action buttons](./images/action-buttons.png)

## Reference app

To build a sample full-app embed, see our [reference app on GitHub](https://github.com/metabase/sso-examples/tree/master/app-embed-example).

## Further reading

- [Strategies for delivering customer-facing analytics](https://www.metabase.com/learn/embedding/embedding-overview).
- [Permissions strategies](https://www.metabase.com/learn/permissions/strategy).
- [Customizing Metabase's appearance](../configuring-metabase/appearance.md).

# Overview

## What Is the Aqara Life App?

Aqara Life is a new form of independent App that provides differentiated services for different user groups. It has the ability to continuously evolve and support personalized expansion, presenting different product experiences based on the devices, spatial capabilities, and usage scenarios each user has.

For users who only have a small number of standalone devices, Aqara Life allows them to experience the core capabilities of those devices. For users who already have a gateway, it can unlock more complete device functions and automation linkage capabilities. When users use an edge hub device with [Aqara Studio](../aqara-studio/overview/introduction.mdx) capabilities, they can further access more advanced AI spatial intelligence and experience the local capabilities brought by Aqara Studio.

From a system perspective, Aqara Life mainly undertakes the following types of capabilities:

**First, operation.**<br />
It loads already-defined spatial solutions and enables a configured spatial application to truly run.

**Second, rendering.**<br />
It can present different interface views and interaction methods based on different space types and different user roles.

**Third, connection.**<br />
It connects Aqara Studio capabilities, device status, and the plugin engine system, allowing different capabilities to be invoked and presented in the App.

**Fourth, experience.**<br />
It tries to avoid exposing users directly to complex system structures, instead transforming these capabilities into more natural and easier-to-use daily experiences.

## What Is the Aqara Life App Like for Users with Aqara Studio?

If users own an edge hub device with Aqara Studio capabilities, such as M300, they can first complete the pre-configuration of spatial solutions in [Aqara Builder](https://builder.aqara.com/) or the Aqara Studio platform, and then use Aqara Life App for daily use.

Therefore, Aqara Life App does not need to carry very comprehensive editing modules. Instead, it focuses on the interface views and service capabilities applicable to the devices currently owned by the user. Advanced configuration can be completed centrally in Aqara Builder, while daily use can take place anytime and anywhere in Aqara Life. In this way, the App does not need to stack complex editing functions, making the overall experience lighter, clearer, and more aligned with personalized usage needs.

The biggest difference between Aqara Life App and Aqara Home App is that users can freely configure the new functions and new plugins they want to add to Aqara Life based on their own needs. They can even replace, add, or remove the function pages presented by default in the App, combining them into a usage interface that better fits their own needs.

Users can either explore and configure on their own, or ask service providers to complete the early-stage whole-home smart solution design, pre-configuration, and on-site implementation. Service providers can configure corresponding device permissions and dashboard views based on the usage needs of different user groups in the home, and ultimately deliver them to users and their family members for use.

Under this development paradigm, the application of new AI technologies also has greater freedom, allowing validation and implementation to be completed more quickly. In the App, users can use the AI assistant to perform operations such as device queries, device control, and automation creation and editing. AI dialogue will become an important way for users to interact with the spatial system.

If a floor plan has been pre-configured in the Builder platform, the system will be able to better understand the home's [Spatial Ontology](https://docs.aqara.com/docs/aqara-studio/overview/core-concepts/#spatial-ontology-and-the-orap-model) and grasp the relative positions of devices within the space, thereby more accurately understanding user intent in conversational responses. For example, a user can say, “Turn on the light above the sofa” or “Set up a movie-watching mode.” Once the system understands the positional relationships between devices and the spatial scope, it can provide more appropriate responses and execution results.

## What Is the Aqara Life App Like for Users Without Aqara Studio?

For users who do not yet have Aqara Studio, they can also synchronize devices that have already been added into Aqara Life by importing them from Aqara Home, and use the core functions of these devices. They can also have an initial experience through Matter Controller and Zigbee Direct. If users choose to use the Aqara device ecosystem over the long term, they may consider purchasing an Aqara hub/gateway or an edge hub device with Aqara Studio capabilities later.

This means that Aqara Life does not only serve advanced spatial intelligence users. It can also provide a lighter and more flexible experience entry point for users who already have Aqara devices. As users' device capabilities and spatial configuration capabilities improve, Aqara Life can also gradually unlock more functions and services.

## Plugin-Based Architecture: Capabilities That Can Continuously Grow

Aqara Life is not an App with a fixed set of functions. It is an App that can grow and be personally defined.

In terms of technical architecture, Aqara Life adopts a plugin-based architecture: the core system remains stable, while functional capabilities are expanded through plugins. In the future, we will open plugin capabilities through the Aqara Builder community, supporting multiple types of plugins, including protocol plugins, function plugins, and extension plugins.

Developers can install, update, and combine plugins as needed, enabling customized expansion from device access to business logic. For example, users can replace an official device plugin with a more interesting gameplay plugin that better suits a specific scenario, or customize the official Tab bar by adding or removing items and replacing them with content that better matches their own usage habits and needs.

The value of this mechanism lies in the fact that the system itself no longer presets a fixed “complete function set.” Instead, it provides an evolvable foundation that can adapt to constantly changing needs across different scenarios, from home spaces to large-scale commercial projects.

## From Page Structure to Space and Roles

In traditional smart home Apps, the structures seen by all users are basically similar: device lists, room lists, automation lists, and then continuous expansion through hierarchy. However, in the real world, different spaces and different roles have different needs for how a space is presented and operated.

For example, in a home space, the home manager is more concerned with the overall status of the home, member information, and convenient management of devices and automations. Elderly family members, however, may only need a few commonly used scenes and devices, and may require an interface with larger fonts and more direct operations.

In an apartment space, residents usually only need to see the control entries related to the devices in their own rooms. The interface needs to be intuitive, simple, and clearly bounded.

In a retail store space, the store manager may be more concerned with quickly checking store operations through cameras, while also understanding operational information such as customer traffic and staff attendance.

Even within the same home space, different roles such as parents, children, elderly family members, and caregivers may have different interface views and different scopes of device permissions.

Therefore, in Aqara Life App, we no longer start purely from “page structure.” Instead, we start from “space” and “roles.” The same space can present different usage interfaces, permission scopes, and service content under different user roles, allowing smart spaces to truly become user-centered.

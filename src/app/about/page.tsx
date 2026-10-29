import type { Metadata } from "next";
import { SITE } from "@/config/site"; import { PageHeader } from "@/components/layout/page-header"; import { Prose } from "@/components/layout/prose";
export const metadata: Metadata = { title: "About DeshConnect" };
export default function AboutPage() {
return (
<>
<PageHeader
title="About DeshConnect"
description={SITE.description}
/>
<div className="container-x py-10">
<Prose>
<h2>Our Mission</h2>
<p>
DeshConnect is an information and community platform built for the people of Bangladesh. Here you can find
everything in one place: tourism, education, healthcare, business, government services, blood donation,
news, and local activities. On this website, organized from division down to upazila, find the information
you need with ease.
</p>
<h2>Our Services</h2>
<ul>
<li>Places of interest and historical monuments across all divisions.</li>
<li>Schools, colleges, madrasas, hospitals, and health centers.</li>
<li>Local businesses, hotels, restaurants, and services.</li>
<li>Government offices, required documents, and opening hours.</li>
<li>Voluntary blood donor registration and blood request coordination.</li>
<li>Community posts, comments, reviews, news, and reports.</li>
</ul>
<h2>How We Manage Information</h2>
<p>
Each listing shows a verification status and the date it was last verified. We never invent missing
information; verified data and community-provided data are displayed separately. A donor's contact details,             date of birth, private messages, and reports are never made public without explicit consent.           </p>            <h2>Contact</h2>           <p>             For corrections to information, partnerships, or feedback, visit our contact page. DeshConnect helps             people connect voluntarily; it does not guarantee donor eligibility, blood availability, or medical             suitability.           </p>         </Prose>       </div>     </>   ); }

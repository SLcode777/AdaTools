import { db } from "@/src/lib/db";
import { render } from "@react-email/components";
import DomainReminderEmail from "@/src/emails/domain-reminder";
import { resend } from "./resend";

export async function sendDomainReminders() {
  const now = new Date();
  const oneWeekFromNow = new Date(now);
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  const oneMonthFromNow = new Date(now);
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  // Get all users with domains expiring soon
  const users = await db.user.findMany({
    where: {
      domainNames: {
        some: {
          expiresAt: {
            lte: oneMonthFromNow,
            gte: now,
          },
        },
      },
    },
    include: {
      domainNames: {
        where: {
          expiresAt: {
            lte: oneMonthFromNow,
            gte: now,
          },
        },
      },
    },
  });

  for (const user of users) {
    const oneWeekDomains = user.domainNames.filter((domain) => {
      const daysUntilExpiry = Math.ceil(
        (domain.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 7 && domain.reminderOneWeek;
    });

    const oneMonthDomains = user.domainNames.filter((domain) => {
      const daysUntilExpiry = Math.ceil(
        (domain.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return (
        daysUntilExpiry > 7 &&
        daysUntilExpiry <= 30 &&
        domain.reminderOneMonth
      );
    });

    // Send 1-week reminder
    if (oneWeekDomains.length > 0) {
      const shouldSendWeekReminder = oneWeekDomains.some((domain) => {
        if (!domain.lastReminderSent) return true;
        const daysSinceLastReminder = Math.ceil(
          (now.getTime() - domain.lastReminderSent.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysSinceLastReminder >= 7;
      });

      if (shouldSendWeekReminder) {
        const emailHtml = await render(
          DomainReminderEmail({
            domains: oneWeekDomains,
            daysUntilExpiry: 7,
          })
        );

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: user.email,
          subject: `Domain expiration reminder - ${oneWeekDomains.length} domain${oneWeekDomains.length > 1 ? "s" : ""} expiring in 1 week`,
          html: emailHtml,
        });

        // Update last reminder sent
        await Promise.all(
          oneWeekDomains.map((domain) =>
            db.domainName.update({
              where: { id: domain.id },
              data: { lastReminderSent: now },
            })
          )
        );
      }
    }

    // Send 1-month reminder
    if (oneMonthDomains.length > 0) {
      const shouldSendMonthReminder = oneMonthDomains.some((domain) => {
        if (!domain.lastReminderSent) return true;
        const daysSinceLastReminder = Math.ceil(
          (now.getTime() - domain.lastReminderSent.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysSinceLastReminder >= 30;
      });

      if (shouldSendMonthReminder) {
        const emailHtml = await render(
          DomainReminderEmail({
            domains: oneMonthDomains,
            daysUntilExpiry: 30,
          })
        );

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: user.email,
          subject: `Domain expiration reminder - ${oneMonthDomains.length} domain${oneMonthDomains.length > 1 ? "s" : ""} expiring in 1 month`,
          html: emailHtml,
        });

        // Update last reminder sent
        await Promise.all(
          oneMonthDomains.map((domain) =>
            db.domainName.update({
              where: { id: domain.id },
              data: { lastReminderSent: now },
            })
          )
        );
      }
    }
  }
}

import { colorPaletteRouter } from "./routers/color-palette";
import { domainNamesRouter } from "./routers/domain-names";
import { moduleRouter } from "./routers/module";
import { pomodoroRouter } from "./routers/pomodoro";
import { removebgRouter } from "./routers/removebg";
import { snippetsRouter } from "./routers/snippets";
import { stickyNoteRouter } from "./routers/sticky-note";
import { testRouter } from "./routers/test";
import { translatorRouter } from "./routers/translator";
import { webpConverterRouter } from "./routers/webp-converter";
import { youtubeVideosRouter } from "./routers/youtube-videos";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  test: testRouter,
  module: moduleRouter,
  pomodoro: pomodoroRouter,
  removeBg: removebgRouter,
  translator: translatorRouter,
  webpConverter: webpConverterRouter,
  colorPalette: colorPaletteRouter,
  domainNames: domainNamesRouter,
  snippets: snippetsRouter,
  stickyNote: stickyNoteRouter,
  youtubeVideos: youtubeVideosRouter,
});

export type AppRouterType = typeof appRouter;

import type { Article } from "~/utils/content.server/articles/types";
import { readingTime } from "reading-time-estimator";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { CardBadge } from "~/components/card-badge";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import type { RelatedArticle } from "./related-articles";
import { PrefetchPageLinks } from "react-router";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { getImgSrc, getInitials } from "~/utils/misc";

type ArticleCardProps = {
  article: Article | RelatedArticle;
  index: number;
};

export function ArticleCard({ article, index }: ArticleCardProps) {
  const stats = readingTime(article.markdown);
  const MAX_EXCERPT_LENGTH = 150;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group h-full"
    >
      {/* Prefetch article resources for instant navigation */}
      <PrefetchPageLinks page={`/articles/${article.slug}`} />
      <Card className="h-full overflow-hidden pt-0 transition-shadow duration-300 hover:shadow-md">
        <CardHeader className="relative p-0">
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              width={600}
              height={300}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <CardBadge className="capitalize">{article.category.title}</CardBadge>
        </CardHeader>

        <CardContent className="-mb-2">
          <div className="text-muted-foreground mb-3 flex items-center justify-between gap-2 text-sm">
            <span>{format(article.createdAt, "MMMM dd, yyyy")}</span>
            <span>{stats.text}</span>
          </div>

          {/* Article title and excerpt */}
          <CardTitle className="group-hover:text-primary mb-2 text-lg transition-colors">
            {article.title}
          </CardTitle>
          <CardDescription className="line-clamp-3">
            {article.excerpt.length > MAX_EXCERPT_LENGTH
              ? `${article.excerpt.slice(0, MAX_EXCERPT_LENGTH)}...`
              : article.excerpt}
          </CardDescription>
        </CardContent>

        <CardFooter className="-mb-4 mt-auto flex justify-between pt-0">
          {"author" in article && article.author ? (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={
                    env.MODE === "development"
                      ? getImgSrc({
                          seed: article.author.name.split(" ")[0],
                        })
                      : article.author.image
                  }
                />
                <AvatarFallback>
                  {getInitials(article.author.name)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{article.author.name}</p>
            </div>
          ) : null}
          <Button
            variant={"link"}
            className="flex items-center font-medium text-blue-600 dark:text-blue-600"
          >
            Read Article
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.article>
  );
}

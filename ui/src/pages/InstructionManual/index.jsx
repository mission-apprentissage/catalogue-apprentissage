import { useEffect, useState, useRef } from "react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";

import { useLocation } from "react-router-dom";
import { Box, Container, ListItem, Text, UnorderedList, Link } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkTextId from "remark-heading-id";
import remarkImages from "remark-images";
import remarkToc from "remark-toc";
import remarkNormalizeTexts from "remark-normalize-headings";
import rehypeToc from "rehype-toc";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";

import parcoursup from "./assets/parcoursup.md";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
// import theme from "../../theme";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";

const MarkdownTheme = {
  h1: (props) => {
    const { children, ...rest } = props;
    return (
      <Text {...rest} as="h3" variant="h3" textStyle="h3" mt={12} mb={4}>
        {children}
      </Text>
    );
  },
  h2: (props) => {
    const { children, ...rest } = props;
    return (
      <Text {...rest} as="h4" variant="h4" textStyle="h4" mt={10} mb={4}>
        {children}
      </Text>
    );
  },
  h3: (props) => {
    const { children, ...rest } = props;
    return (
      <Text {...rest} as="h5" variant="h5" textStyle="h5" mt={8} mb={4} ml={4}>
        {children}
      </Text>
    );
  },
  h4: (props) => {
    const { children, ...rest } = props;
    return (
      <Text {...rest} as="h6" variant="h6" textStyle="h6" mt={6} mb={4} ml={8}>
        {children}
      </Text>
    );
  },

  h5: (props) => {
    const { children, ...rest } = props;
    return (
      <Text {...rest} as="h7" variant="h7" textStyle="h7" mt={4} mb={4} ml={12}>
        {children}
      </Text>
    );
  },
  // h6: (props) => {
  //   const { children } = props;
  //   return (
  //     <Text variant="h6" textStyle="h6" mt={2} mb={4}>
  //       {children}
  //     </Text>
  //   );
  // },
  p: (props) => {
    const { children, ...rest } = props;
    return (
      <Text mb={4} {...rest}>
        {children}
      </Text>
    );
  },
  a: (props) => {
    const { href, children, ...rest } = props;
    return (
      <Link
        {...rest}
        href={href}
        variant={"secondary-text"}
        textDecoration="underline"
        cursor="pointer"
        fontWeight="bold"
        lineHeight={2}
      >
        {children}
      </Link>
    );
  },
  // code: (props) => {
  //   const { children } = props;
  //   // console.log("props", props)
  //   console.log(children.includes("\n"));
  //   if (children.includes("\n")) {
  //     return <Code children={children} colorScheme="purple" width="100%" p="1em 1em" />;
  //   } else {
  //     return <a style={{ backgroundColor: "lightgray", padding: "0 0.2em" }}>{children}</a>;
  //   }
  // },
  ul: (props) => {
    const { children } = props;
    return (
      <UnorderedList mb={4} ml={8}>
        {children}
      </UnorderedList>
    );
  },
  li: (props) => {
    const { children } = props;
    return (
      <ListItem>
        <Text variant={"secondary-text"} lineHeight={2}>
          {children}
        </Text>
      </ListItem>
    );
  },
};

export const InstructionManual = ({ plateforme }) => {
  const [markdown, setMarkdown] = useState("");
  const location = useLocation();
  const lastHash = useRef(null);

  const title = `Catalogue des offres de formation en apprentissage : mode d’emploi à l’usage des SAIO et SRFD`;
  setTitle(title);

  useEffect(() => {
    fetch(parcoursup)
      .then((response) => response.text())
      .then((text) => setMarkdown(text));
  }, [plateforme]);

  useEffect(() => {
    if (location.hash) {
      lastHash.current = decodeURIComponent(location.hash.slice(1)); // safe hash for further use after navigation
    }

    setTimeout(() => {
      if (lastHash.current && document.getElementById(lastHash.current)) {
        document.getElementById(lastHash.current)?.scrollIntoView({ behavior: "smooth", block: "start" });
        lastHash.current = "";
      }
    }, 100);
  }, [location, lastHash]);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              { title: "Mode d'emploi Parcoursup", to: "/mode-emploi/parcoursup" },
            ]}
          />
          <Text as="h2" textStyle="h2" color="grey.800" mt={5} pb={4}>
            {title}
          </Text>
          <Text as="h3" textStyle="h3" color="grey.800" mt={4} pb={4}>
            Édition Parcoursup 2024-2025
          </Text>
          <Box>
            <Text as="h3" variant="h3" textStyle="h3" mt={12} mb={4} id="sommaire">
              Sommaire
            </Text>

            <ReactMarkdown
              components={ChakraUIRenderer(MarkdownTheme)}
              children={markdown}
              remarkPlugins={[[remarkGfm], [remarkTextId], [remarkToc], [remarkNormalizeTexts], [remarkImages]]}
              rehypePlugins={[
                rehypeRaw,
                rehypeSlug,
                [rehypeToc, { headings: ["h2"], maxDepth: 1 }],
                [rehypeExternalLinks, { target: "_blank", rel: ["nofollow"] }],
                [
                  rehypeAutolinkHeadings,
                  {
                    behavior: "prepend",
                    properties: {
                      style: {
                        display: "inline-flex",
                        alignItems: "center",
                        marginLeft: "-24px",
                        marginRight: "8px",
                        color: "lightgray",
                      },
                    },
                    content: fromHtmlIsomorphic(
                      '<svg class="octicon octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z" fill="currentColor"></path></svg>',
                      { fragment: true }
                    ).children,
                  },
                ],
              ]}
            />
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default InstructionManual;

.PHONY: dev build clean new-post

HUGO ?= hugo

dev:
	$(HUGO) server --buildDrafts --buildFuture --disableFastRender

build:
	$(HUGO) --minify

clean:
	rm -rf public resources

# usage: make new-post SLUG=some-slug TAG=Essay
new-post:
	@if [ -z "$(SLUG)" ]; then echo "SLUG is required (e.g. make new-post SLUG=my-post TAG=Essay)"; exit 1; fi
	@TAG_VAL="$${TAG:-Essay}"; \
	DATE=$$(date +%Y-%m-%d); \
	FILE="content/writing/$$DATE-$(SLUG).md"; \
	if [ -e "$$FILE" ]; then echo "refusing to overwrite $$FILE"; exit 1; fi; \
	$(HUGO) new "writing/$$DATE-$(SLUG).md"; \
	awk -v tag="$$TAG_VAL" -v slug="$(SLUG)" ' \
	  /^tags:/ { print "tags: [" tag "]"; next } \
	  /^slug:/ { print "slug: \"" slug "\""; next } \
	  { print }' "$$FILE" > "$$FILE.tmp" && mv "$$FILE.tmp" "$$FILE"; \
	echo "created $$FILE"

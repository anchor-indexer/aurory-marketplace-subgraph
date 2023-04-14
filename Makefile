deploy:
	@anchor-indexer deploy aurory-marketplace

create:
	@anchor-indexer create aurory-marketplace mainnet

remove:
	@anchor-indexer remove aurory-marketplace

codegen:
	@anchor-indexer codegen

build:
	@$(MAKE) codegen
	@anchor-indexer build

.PHONY: deploy create remove codegen build
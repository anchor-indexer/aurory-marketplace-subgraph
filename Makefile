deploy:
	@$(MAKE) idl
	@anchor-indexer deploy aurory-marketplace

create:
	@anchor-indexer create aurory-marketplace mainnet

remove:
	@anchor-indexer remove aurory-marketplace

codegen:
	@$(MAKE) idl
	@anchor-indexer codegen

build:
	@$(MAKE) idl
	@$(MAKE) codegen
	@anchor-indexer build

idl:
	@mkdir -p idls
	@ln -fs $(PWD)/../js/types/comptoir.json idls

.PHONY: deploy create remove codegen build idl
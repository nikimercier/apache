# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := oracle_bindings
### Rules for final target.
LDFLAGS_Debug := \
	-undefined dynamic_lookup \
	-Wl,-no_pie \
	-Wl,-search_paths_first \
	-mmacosx-version-min=10.7 \
	-arch x86_64 \
	-L$(builddir) \
	-stdlib=libc++

LIBTOOLFLAGS_Debug := \
	-undefined dynamic_lookup \
	-Wl,-no_pie \
	-Wl,-search_paths_first

LDFLAGS_Release := \
	-undefined dynamic_lookup \
	-Wl,-no_pie \
	-Wl,-search_paths_first \
	-mmacosx-version-min=10.7 \
	-arch x86_64 \
	-L$(builddir) \
	-stdlib=libc++

LIBTOOLFLAGS_Release := \
	-undefined dynamic_lookup \
	-Wl,-no_pie \
	-Wl,-search_paths_first

LIBS :=

$(builddir)/oracle_bindings.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(builddir)/oracle_bindings.node: LIBS := $(LIBS)
$(builddir)/oracle_bindings.node: GYP_LIBTOOLFLAGS := $(LIBTOOLFLAGS_$(BUILDTYPE))
$(builddir)/oracle_bindings.node: TOOLSET := $(TOOLSET)
$(builddir)/oracle_bindings.node:  FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += $(builddir)/oracle_bindings.node
# Add target alias
.PHONY: oracle_bindings
oracle_bindings: $(builddir)/oracle_bindings.node

# Short alias for building this executable.
.PHONY: oracle_bindings.node
oracle_bindings.node: $(builddir)/oracle_bindings.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/oracle_bindings.node

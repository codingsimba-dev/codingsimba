import React from "react";

type MobileNavContextType = {
  open: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
};

const MobileNavContext = React.createContext<MobileNavContextType | undefined>(
  undefined,
);

function MobileNavProvider(props: React.PropsWithChildren) {
  const [open, setOpen] = React.useState(false);

  const contextValue = React.useMemo(
    () => ({
      open,
      openMobileNav: () => setOpen(true),
      closeMobileNav: () => setOpen(false),
      toggleMobileNav: () => setOpen((prev) => !prev),
    }),
    [open],
  );

  return <MobileNavContext.Provider value={contextValue} {...props} />;
}

function useMobileNav() {
  const context = React.use(MobileNavContext);
  if (context === undefined) {
    throw new Error("useMobileNav must be used within an MobileNavProvider");
  }
  return context;
}

export { useMobileNav, MobileNavProvider };

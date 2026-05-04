"use client";

import Header from "@/components/Header";
import SectionContainer from "@/components/ui/SectionContainer";
import ShopCreditBundlesSection from "@/components/shop/ShopCreditBundlesSection";
import ShopMysterySectionHeader from "@/components/shop/ShopMysterySectionHeader";
import ShopMysteryTierSections from "@/components/shop/ShopMysteryTierSections";
import ShopTiffanyDivider from "@/components/shop/ShopTiffanyDivider";

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header showCategoryStrip={false} />
      <main
        id="main-content"
        className="mx-auto max-w-7xl px-page-x py-page-y md:py-10 pb-16 md:pb-20"
      >
        <SectionContainer className="max-w-none pt-2 md:pt-4">
          <ShopMysterySectionHeader />
          <ShopMysteryTierSections />
        </SectionContainer>

        <ShopTiffanyDivider className="mt-10 md:mt-12 w-full" />

        <header className="flex flex-col items-center text-center mt-10 md:mt-12">
          <h2 className="font-kalshi text-[1.95rem] font-bold leading-[1.05] tracking-[-0.022em] text-white sm:text-[2.35rem] md:text-[2.75rem]">
            Acquista crediti
          </h2>
        </header>

        <div className="mt-7 md:mt-9 -mx-page-x px-1.5 sm:mx-0 sm:px-0">
          <ShopCreditBundlesSection />
        </div>
      </main>
    </div>
  );
}

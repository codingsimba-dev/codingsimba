import { Badge } from "~/components/ui/badge";

/**
 * Team pricing explanation component
 *
 * Displays information about per-seat pricing for team plans,
 * including benefits like no setup fees and flexible member management.
 *
 * @returns {JSX.Element} Team pricing information section
 */
export function TeamPricingExplanation() {
  return (
    <div className="mb-12 text-center">
      <div className="border-primary/20 bg-primary/5 mx-auto max-w-4xl rounded-xl border p-6">
        <h3 className="text-primary mb-3 text-xl font-semibold">
          Simple Per-Seat Pricing
        </h3>
        <p className="text-primary/80 mb-4">
          Our team plans scale with your organization. Pay only for active team
          members with no hidden fees.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            ✓ No setup fees
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            ✓ Add/remove members anytime
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            ✓ Prorated billing
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            ✓ Volume discounts available
          </Badge>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual discount tier component
 *
 * Displays a single volume discount tier with the discount percentage
 * and required member count.
 *
 * @param {Object} props - Component props
 * @param {string} props.discount - Discount percentage (e.g., "5%")
 * @param {string} props.memberCount - Required member count (e.g., "25+ members")
 *
 * @returns {JSX.Element} A discount tier card
 */
function MembersCount({
  discount,
  memberCount,
}: {
  discount: string;
  memberCount: string;
}) {
  return (
    <div className="bg-card rounded-lg border p-4 text-center">
      <div className="text-success mb-1 text-2xl font-bold">{discount}</div>
      <div className="text-muted-foreground text-sm">{memberCount}</div>
    </div>
  );
}

/**
 * Volume discounts component
 *
 * Displays available volume discounts for team plans based on
 * member count, encouraging larger team purchases.
 *
 * @returns {JSX.Element} Volume discounts information section
 */
export function VolumeDiscounts() {
  return (
    <div className="mt-12">
      <div className="border-primary/20 from-primary/5 to-secondary/5 rounded-xl border bg-gradient-to-r p-8">
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-2xl font-bold">
            Volume Discounts Available
          </h3>
          <p className="text-muted-foreground">
            Save more as your team grows with our automatic volume discounts
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { discount: "5%", memberCount: "25+ members" },
            { discount: "10%", memberCount: "50+ members" },
            { discount: "15%", memberCount: "100+ members" },
            { discount: "20%", memberCount: "250+ members" },
          ].map((item) => (
            <MembersCount key={item.discount} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

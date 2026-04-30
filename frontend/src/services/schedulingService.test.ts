import { formatBookingMessage } from "./schedulingService";

describe("formatBookingMessage", () => {
  test("returns success message for valid booking data", () => {
    const result = formatBookingMessage({
      courseNum: "CS110",
      tutorId: "t1",
      slotId: "s1",
    });

    expect(result).toMatch(/Booked CS110/);
  });

  test("blocks booking when tutor does not teach selected course", () => {
    const result = formatBookingMessage({
      courseNum: "MATH155",
      tutorId: "t1",
      slotId: "s1",
    });

    expect(result).toMatch(/does not currently cover MATH155/);
  });

  test("blocks booking when slot does not belong to selected tutor", () => {
    const result = formatBookingMessage({
      courseNum: "CS110",
      tutorId: "t1",
      slotId: "s3",
    });

    expect(result).toMatch(/time slot is no longer available/);
  });
});
